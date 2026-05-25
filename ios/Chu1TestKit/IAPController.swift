import Foundation
import StoreKit

@MainActor
final class IAPController: ObservableObject {
    @Published private(set) var isProcessing = false
    @Published private(set) var statusMessage: String?

    private let config: AppConfig
    private let verifier: AppleIAPVerifier
    private var product: Product?
    private var transactionUpdatesTask: Task<Void, Never>?

    init(config: AppConfig = .production, verifier: AppleIAPVerifier? = nil) {
        self.config = config
        self.verifier = verifier ?? AppleIAPVerifier(config: config)
    }

    func startTransactionUpdates(
        cookies: @escaping () async -> [HTTPCookie],
        onVerified: @escaping @MainActor () -> Void
    ) {
        guard transactionUpdatesTask == nil else { return }

        transactionUpdatesTask = Task { [weak self] in
            for await result in Transaction.updates {
                guard let self else { return }
                do {
                    let signedTransactionInfo = result.jwsRepresentation
                    let transaction = try verifiedTransaction(from: result)
                    guard transaction.productID == config.productID else { continue }
                    _ = try await verifier.verify(
                        signedTransactionInfo: signedTransactionInfo,
                        source: .update,
                        cookies: await cookies()
                    )
                    await transaction.finish()
                    onVerified()
                } catch {
                    statusMessage = "購入状態の更新を確認できませんでした。時間をおいて再度お試しください。"
                }
            }
        }
    }

    func purchase(cookies: [HTTPCookie]) async -> Bool {
        isProcessing = true
        defer { isProcessing = false }

        do {
            let product = try await loadLifetimeProduct()
            let result = try await product.purchase()

            switch result {
            case .success(let verificationResult):
                let signedTransactionInfo = verificationResult.jwsRepresentation
                let transaction = try verifiedTransaction(from: verificationResult)
                _ = try await verifier.verify(
                    signedTransactionInfo: signedTransactionInfo,
                    source: .purchase,
                    cookies: cookies
                )
                await transaction.finish()
                statusMessage = nil
                return true
            case .pending:
                statusMessage = "購入が保留中です。承認後に自動で反映されます。"
                return false
            case .userCancelled:
                statusMessage = "購入をキャンセルしました。"
                return false
            @unknown default:
                statusMessage = "購入を完了できませんでした。時間をおいて再度お試しください。"
                return false
            }
        } catch {
            statusMessage = "購入を完了できませんでした。時間をおいて再度お試しください。"
            return false
        }
    }

    func restore(cookies: [HTTPCookie]) async -> Bool {
        isProcessing = true
        defer { isProcessing = false }

        do {
            try await AppStore.sync()
            var didRestore = false

            for await result in Transaction.currentEntitlements {
                let signedTransactionInfo = result.jwsRepresentation
                let transaction = try verifiedTransaction(from: result)
                guard transaction.productID == config.productID else { continue }

                _ = try await verifier.verify(
                    signedTransactionInfo: signedTransactionInfo,
                    source: .restore,
                    cookies: cookies
                )
                await transaction.finish()
                didRestore = true
            }

            if didRestore {
                statusMessage = nil
                return true
            }

            statusMessage = "復元できる購入が見つかりませんでした。"
            return false
        } catch {
            statusMessage = "購入の復元に失敗しました。時間をおいて再度お試しください。"
            return false
        }
    }

    func clearStatus() {
        statusMessage = nil
    }

    private func loadLifetimeProduct() async throws -> Product {
        if let product { return product }

        let products = try await Product.products(for: [config.productID])
        guard let product = products.first(where: { $0.id == config.productID }) else {
            throw StoreKitError.notAvailableInStorefront
        }

        self.product = product
        return product
    }

    private func verifiedTransaction(
        from result: VerificationResult<Transaction>
    ) throws -> Transaction {
        switch result {
        case .verified(let transaction):
            return transaction
        case .unverified(_, let error):
            throw error
        }
    }
}
