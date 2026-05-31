import XCTest
import WebKit
@testable import Chu1TestKit

final class StoreReviewBridgeTests: XCTestCase {
    func testCoordinatorInvokesReviewHandlerForReviewMessage() throws {
        let expectation = self.expectation(description: "review handler invoked")
        let model = WebViewModel(config: .production)
        let coordinator = AppWebView.Coordinator(
            model: model,
            onBridgeMessage: { _, _ in },
            onReviewRequested: {
                expectation.fulfill()
            }
        )

        let scriptMessage = TestScriptMessage(name: "review", body: [:])
        coordinator.userContentController(WKUserContentController(), didReceive: scriptMessage)

        wait(for: [expectation], timeout: 1.0)
    }

    func testCoordinatorIgnoresUnknownMessageNames() throws {
        let model = WebViewModel(config: .production)
        var reviewCalled = false
        let coordinator = AppWebView.Coordinator(
            model: model,
            onBridgeMessage: { _, _ in },
            onReviewRequested: { reviewCalled = true }
        )

        let scriptMessage = TestScriptMessage(name: "unknown", body: [:])
        coordinator.userContentController(WKUserContentController(), didReceive: scriptMessage)

        XCTAssertFalse(reviewCalled)
    }
}

private final class TestScriptMessage: WKScriptMessage {
    private let _name: String
    private let _body: Any
    init(name: String, body: Any) {
        self._name = name
        self._body = body
        super.init()
    }
    override var name: String { _name }
    override var body: Any { _body }
}
