package com.tradingapp.service;

import com.tradingapp.modal.Wallet;
import com.tradingapp.modal.WalletTransaction;

import java.util.List;

public interface TransactionService {

    List<WalletTransaction> getTransactionsByWallet(Wallet wallet);
}