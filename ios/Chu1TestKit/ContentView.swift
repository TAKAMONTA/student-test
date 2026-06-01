import SwiftUI
import WebKit

struct ContentView: View {
    @ObservedObject var webViewModel: WebViewModel
    @StateObject private var iapController: IAPController
    @State private var didAttemptLocalTestLogin = false

    init(webViewModel: WebViewModel) {
        self.webViewModel = webViewModel
        _iapController = StateObject(wrappedValue: IAPController(config: webViewModel.config))
    }

    var body: some View {
        AppWebView(
            model: webViewModel,
            config: webViewModel.config,
            onBridgeMessage: handleBridgeMessage
        )
            .ignoresSafeArea(.container, edges: .bottom)
            .task {
                await runLocalTestLoginIfNeeded()
                iapController.startTransactionUpdates(
                    cookies: { await WKWebsiteDataStore.default().httpCookieStore.allCookies() },
                    onVerified: { webViewModel.openHome() }
                )
            }
            .alert("購入処理", isPresented: statusAlertBinding) {
                Button("OK", role: .cancel) {
                    iapController.clearStatus()
                }
            } message: {
                Text(iapController.statusMessage ?? "")
            }
    }

    private var statusAlertBinding: Binding<Bool> {
        Binding(
            get: { iapController.statusMessage != nil },
            set: { isPresented in
                if !isPresented {
                    iapController.clearStatus()
                }
            }
        )
    }

    private func handleBridgeMessage(_ message: IAPBridgeMessage, cookies: [HTTPCookie]) {
        Task {
            let verified: Bool
            switch message {
            case .purchase:
                verified = await iapController.purchase(cookies: cookies)
            case .restore:
                verified = await iapController.restore(cookies: cookies)
            }

            if verified {
                webViewModel.openHome()
            }
        }
    }

    @MainActor
    private func runLocalTestLoginIfNeeded() async {
        guard !didAttemptLocalTestLogin else { return }
        guard let request = try? LocalTestLoginRequest.make(config: webViewModel.config) else { return }
        didAttemptLocalTestLogin = true

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let httpResponse = response as? HTTPURLResponse, 200..<300 ~= httpResponse.statusCode else {
                return
            }

            guard let requestURL = request.url else { return }
            let cookies = HTTPCookie.cookies(
                withResponseHeaderFields: responseHeaderFields(from: httpResponse),
                for: requestURL
            )
            await WKWebsiteDataStore.default().httpCookieStore.setCookies(cookies)

            let payload = try? JSONDecoder().decode(LocalTestLoginResponse.self, from: data)
            guard payload?.directLogin == true else { return }

            if
                let redirectTo = payload?.redirectTo,
                let redirectURL = URL(string: redirectTo, relativeTo: webViewModel.config.appURL)?.absoluteURL,
                webViewModel.canOpen(redirectURL)
            {
                webViewModel.open(redirectURL)
            } else {
                webViewModel.openHome()
            }
        } catch {
            NSLog("Local test login failed: \(String(describing: error))")
        }
    }

    private func responseHeaderFields(from response: HTTPURLResponse) -> [String: String] {
        response.allHeaderFields.reduce(into: [String: String]()) { fields, header in
            guard let key = header.key as? String, let value = header.value as? String else { return }
            fields[key] = value
        }
    }
}

private struct LocalTestLoginResponse: Decodable {
    let directLogin: Bool?
    let redirectTo: String?
}
