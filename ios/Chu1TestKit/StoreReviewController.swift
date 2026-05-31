import StoreKit
import UIKit

enum StoreReviewController {
    /// Asks iOS to display the App Store review prompt. iOS enforces a ≈3-per-year
    /// quota per user and may silently no-op. The caller does not need to track
    /// frequency.
    static func request() {
        guard let scene = activeWindowScene() else { return }
        SKStoreReviewController.requestReview(in: scene)
    }

    private static func activeWindowScene() -> UIWindowScene? {
        let active = UIApplication.shared.connectedScenes.first { scene in
            scene.activationState == .foregroundActive
        }
        if let scene = active as? UIWindowScene { return scene }
        return UIApplication.shared.connectedScenes.first as? UIWindowScene
    }
}
