import Foundation

struct PurchaseVerificationResponse: Decodable, Equatable {
    let ok: Bool
    let purchasedAt: Int64
}

struct AppleIAPVerifier {
    enum Source: String, Codable {
        case purchase
        case restore
        case update
    }

    enum VerificationError: Error, Equatable {
        case invalidResponse
        case rejected(statusCode: Int)
    }

    private struct VerificationRequestBody: Encodable {
        let signedTransactionInfo: String
        let source: Source
    }

    let config: AppConfig
    private let session: URLSession

    init(config: AppConfig = .production, session: URLSession = .shared) {
        self.config = config
        self.session = session
    }

    func makeRequest(
        signedTransactionInfo: String,
        source: Source,
        cookies: [HTTPCookie]
    ) throws -> URLRequest {
        var request = URLRequest(url: config.appleVerifyURL)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(
            VerificationRequestBody(
                signedTransactionInfo: signedTransactionInfo,
                source: source
            )
        )

        if let cookieHeader = HTTPCookie.requestHeaderFields(with: cookies)["Cookie"] {
            request.setValue(cookieHeader, forHTTPHeaderField: "Cookie")
        }

        return request
    }

    func verify(
        signedTransactionInfo: String,
        source: Source,
        cookies: [HTTPCookie]
    ) async throws -> PurchaseVerificationResponse {
        let request = try makeRequest(
            signedTransactionInfo: signedTransactionInfo,
            source: source,
            cookies: cookies
        )
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw VerificationError.invalidResponse
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            throw VerificationError.rejected(statusCode: httpResponse.statusCode)
        }

        return try JSONDecoder().decode(PurchaseVerificationResponse.self, from: data)
    }
}
