import Foundation

struct AppConfig: Equatable {
    let appURL: URL
    let bundleID: String
    let productID: String
    let iosUserAgentToken: String
    let localTestLoginEmail: String?

    static let production = AppConfig(
        appURL: URL(string: "https://chu1-testkit.t-nakaima.workers.dev")!,
        bundleID: "jp.taka.chu1testkit",
        productID: "chu1_testkit_lifetime",
        iosUserAgentToken: "Chu1TestKitIOS/1",
        localTestLoginEmail: nil
    )

    static func current(environment: [String: String] = ProcessInfo.processInfo.environment) -> AppConfig {
        let appURL = environment["CHU1_APP_URL"].flatMap(validAbsoluteURL) ?? production.appURL
        let productID = environment["CHU1_IAP_PRODUCT_ID"].flatMap(nonEmptyString) ?? production.productID
        let localTestLoginEmail = isLocalHost(appURL)
            ? environment["CHU1_TEST_LOGIN_EMAIL"].flatMap(normalizeEmail)
            : nil

        return AppConfig(
            appURL: appURL,
            bundleID: production.bundleID,
            productID: productID,
            iosUserAgentToken: production.iosUserAgentToken,
            localTestLoginEmail: localTestLoginEmail
        )
    }

    var appleVerifyURL: URL {
        appURL.appending(path: "api/apple/iap/verify")
    }

    var localTestLoginURL: URL? {
        guard localTestLoginEmail != nil else { return nil }
        return appURL.appending(path: "api/auth/send")
    }

    private static func validAbsoluteURL(_ value: String) -> URL? {
        guard let url = URL(string: value), url.scheme != nil, url.host != nil else {
            return nil
        }
        return url
    }

    private static func nonEmptyString(_ value: String) -> String? {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }

    private static func normalizeEmail(_ value: String) -> String? {
        nonEmptyString(value)?.lowercased()
    }

    private static func isLocalHost(_ url: URL) -> Bool {
        guard let host = url.host?.lowercased() else { return false }
        return host == "localhost" || host == "127.0.0.1" || host == "::1"
    }
}

enum LocalTestLoginRequest {
    static func make(config: AppConfig) throws -> URLRequest? {
        guard let url = config.localTestLoginURL, let email = config.localTestLoginEmail else { return nil }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: ["email": email])
        return request
    }
}
