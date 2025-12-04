import { IWallet } from '../interfaces/IWallet.js';
import { TransactionStatus } from '../constants.js';
import { Payment, TransactionError } from '../types.js';

interface TransactionCallback {
    (transaction: Transaction): void;
}

export class Transaction {

    public providerData: any = {};
    public error: TransactionError | undefined = undefined;

    private _hash: string;
    private _isSigned: boolean = false;
    private _payments: Payment[] = [];
    private _wallet: IWallet;
    private _currentStatus: TransactionStatus = TransactionStatus.Building;
    private _listeners: TransactionCallback[] = [];

    constructor(wallet: IWallet) {
        this._wallet = wallet;
    }

    get hash(): string {
        return this._hash;
    }

    get isSigned(): boolean {
        return this._isSigned;
    }

    get payments(): Payment[] {
        return this._payments;
    }

    get status(): TransactionStatus {
        return this._currentStatus;
    }

    set status(status: TransactionStatus) {
        this._currentStatus = status;

        this._listeners.forEach((callback: TransactionCallback) => {
            callback(this);
        });
    }

    public payToAddresses(payments: Payment[]): Promise<Transaction> {
        return this._wallet.paymentsForTransaction(this, payments)
            .then(() => {
                this._payments = payments;

                return this as Transaction;
            });
    }

    public sign(): Promise<Transaction> {
        if (this._isSigned) {
            throw new Error('Transaction was already signed.');
        }

        return this._wallet.signTransaction(this)
            .then(() => {
                this._isSigned = true;

                return this as Transaction;
            });
    }

    public submit(): Promise<Transaction> {
        if (! this._isSigned) {
            throw new Error('Must sign transaction before submitting.');
        }
        if (this._hash) {
            throw new Error('Transaction was already submitted.');
        }

        return this._wallet.submitTransaction(this)
            .then((txHash: string) => {
                this._hash = txHash;

                return this as Transaction;
            });
    }

    public onBuilding(callback: TransactionCallback): Transaction {
        this.addListener((transaction: Transaction) => {
            if (transaction.status === TransactionStatus.Building) {
                callback(transaction);
            }
        });

        return this;
    }

    public onSigning(callback: TransactionCallback): Transaction {
        this.addListener((transaction: Transaction) => {
            if (transaction.status === TransactionStatus.Signing) {
                callback(transaction);
            }
        });

        return this;
    }

    public onSubmitting(callback: TransactionCallback): Transaction {
        this.addListener((transaction: Transaction) => {
            if (transaction.status === TransactionStatus.Submitting) {
                callback(transaction);
            }
        });

        return this;
    }

    public onSubmitted(callback: TransactionCallback): Transaction {
        this.addListener((transaction: Transaction) => {
            if (transaction.status === TransactionStatus.Submitted) {
                callback(transaction);
            }
        });

        return this;
    }

    public onError(callback: TransactionCallback): Transaction {
        this.addListener((transaction: Transaction) => {
            if (transaction.status === TransactionStatus.Errored) {
                callback(transaction);
            }
        });

        return this;
    }

    public onFinally(callback: TransactionCallback): Transaction {
        this.addListener((transaction: Transaction) => {
            if (transaction.status === TransactionStatus.Submitted || transaction.status === TransactionStatus.Errored) {
                callback(transaction);
            }
        });

        return this;
    }

    private addListener(callback: TransactionCallback): void {
        this._listeners.push(callback);
    }

}
