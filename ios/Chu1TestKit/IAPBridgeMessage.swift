enum IAPBridgeMessage: Equatable {
    case purchase
    case restore

    init?(body: Any) {
        guard
            let payload = body as? [String: Any],
            let type = payload["type"] as? String
        else {
            return nil
        }

        switch type {
        case "purchase":
            self = .purchase
        case "restore":
            self = .restore
        default:
            return nil
        }
    }
}
