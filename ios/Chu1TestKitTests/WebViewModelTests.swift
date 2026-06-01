import XCTest
@testable import Chu1TestKit

@MainActor
final class WebViewModelTests: XCTestCase {
    func testStartsAtLogin() {
        let model = WebViewModel(config: .production)
        XCTAssertEqual(model.currentURL.absoluteString, "https://chu1-testkit.t-nakaima.workers.dev/login")
    }

    func testAcceptsUniversalLinkFromProductionHost() {
        let model = WebViewModel(config: .production)
        model.open(URL(string: "https://chu1-testkit.t-nakaima.workers.dev/api/auth/verify?token=abc")!)
        XCTAssertEqual(model.currentURL.absoluteString, "https://chu1-testkit.t-nakaima.workers.dev/api/auth/verify?token=abc")
    }

    func testRejectsUnexpectedUniversalLinkHost() {
        let model = WebViewModel(config: .production)
        model.open(URL(string: "https://example.com/api/auth/verify?token=abc")!)
        XCTAssertEqual(model.currentURL.absoluteString, "https://chu1-testkit.t-nakaima.workers.dev/login")
    }

    func testNavigatesHomeAfterPurchaseVerification() {
        let model = WebViewModel(config: .production)
        model.openHome()
        XCTAssertEqual(model.currentURL.absoluteString, "https://chu1-testkit.t-nakaima.workers.dev/home")
    }
}
