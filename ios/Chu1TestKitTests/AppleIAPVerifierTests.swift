import XCTest
@testable import Chu1TestKit

final class AppleIAPVerifierTests: XCTestCase {
    func testBuildsVerificationRequest() throws {
        let verifier = AppleIAPVerifier(config: .production)
        let request = try verifier.makeRequest(
            signedTransactionInfo: "header.payload.signature",
            source: .purchase,
            cookies: []
        )

        XCTAssertEqual(request.url?.absoluteString, "https://chu1-testkit.t-nakaima.workers.dev/api/apple/iap/verify")
        XCTAssertEqual(request.httpMethod, "POST")
        XCTAssertEqual(request.value(forHTTPHeaderField: "Content-Type"), "application/json")

        let body = try XCTUnwrap(request.httpBody)
        let json = try XCTUnwrap(JSONSerialization.jsonObject(with: body) as? [String: String])
        XCTAssertEqual(json["signedTransactionInfo"], "header.payload.signature")
        XCTAssertEqual(json["source"], "purchase")
    }

    func testForwardsCookieHeader() throws {
        let cookie = try XCTUnwrap(HTTPCookie(properties: [
            .domain: "chu1-testkit.t-nakaima.workers.dev",
            .path: "/",
            .name: "session",
            .value: "abc123",
            .secure: "TRUE",
        ]))
        let verifier = AppleIAPVerifier(config: .production)

        let request = try verifier.makeRequest(
            signedTransactionInfo: "header.payload.signature",
            source: .restore,
            cookies: [cookie]
        )

        XCTAssertEqual(request.value(forHTTPHeaderField: "Cookie"), "session=abc123")
    }
}
