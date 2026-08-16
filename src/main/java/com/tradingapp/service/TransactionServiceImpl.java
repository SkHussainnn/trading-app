package com.tradingapp.service;

import com.tradingapp.modal.Wallet;
import com.tradingapp.modal.WalletTransaction;
import com.tradingapp.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Override
    public List<WalletTransaction> getTransactionsByWallet(Wallet wallet) {

        return walletTransactionRepository.findByWallet(wallet);
    }
}