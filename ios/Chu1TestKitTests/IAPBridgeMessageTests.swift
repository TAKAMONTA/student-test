import XCTest
@testable import Chu1TestKit

final class IAPBridgeMessageTests: XCTestCase {
    func testParsesPurchaseMessage() {
        XCTAssertEqual(IAPBridgeMessage(body: ["type": "purchase"]), .purchase)
    }

    func testParsesRestoreMessage() {
        XCTAssertEqual(IAPBridgeMessage(body: ["type": "restore"]), .restore)
    }

    func testRejectsUnknownMessage() {
        XCTAssertNil(IAPBridgeMessage(body: ["type": "close"]))
    }

    func testRejectsMalformedMessage() {
        XCTAssertNil(IAPBridgeMessage(body: "purchase"))
    }
}
