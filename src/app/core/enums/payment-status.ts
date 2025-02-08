export enum  PaymentStatus
        {
            Verified = 1,
            InProgress = 2,
            Success = 3,
            Failed = 4,
            Requested = 5,
            ToVerify = 6,
            Unverified = 7

        }
        export enum  PaymentModeType
        {
            BankOrUPI = 1,
            Whatsapp = 2,
            Telegram = 3,
        }