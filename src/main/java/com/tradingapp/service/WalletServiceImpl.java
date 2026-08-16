package com.tradingapp.service;

import com.tradingapp.domain.OrderType;
import com.tradingapp.domain.WalletTransactionType;
import com.tradingapp.modal.Order;
import com.tradingapp.modal.User;
import com.tradingapp.modal.Wallet;
import com.tradingapp.modal.WalletTransaction;
import com.tradingapp.repository.WalletRepository;
import com.tradingapp.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class WalletServiceImpl implements WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;


    // =========================================================
    // GET USER WALLET
    // =========================================================

    @Override
    public Wallet getUserWallet(User user) {

        Wallet wallet = walletRepository.findByUserId(user.getId());

        if (wallet == null) {

            wallet = new Wallet();

            wallet.setUser(user);

            walletRepository.save(wallet);
        }

        return wallet;
    }


    // =========================================================
    // ADD BALANCE
    // =========================================================

    @Override
    public Wallet addBalance(Wallet wallet, Long money) {

        BigDecimal balance = wallet.getBalance();

        BigDecimal newBalance =
                balance.add(BigDecimal.valueOf(money));

        wallet.setBalance(newBalance);

        Wallet savedWallet =
                walletRepository.save(wallet);


        // Create wallet transaction
        WalletTransaction transaction =
                new WalletTransaction();

        transaction.setWallet(savedWallet);

        transaction.setType(
                WalletTransactionType.ADD_MONEY
        );

        transaction.setDate(LocalDate.now());

        transaction.setPurpose(
                "Money added to wallet"
        );

        transaction.setAmount(money);

        walletTransactionRepository.save(transaction);


        return savedWallet;
    }


    // =========================================================
    // WITHDRAW BALANCE
    // =========================================================

    @Override
    public Wallet withdrawBalance(
            Wallet wallet,
            Long money) {

        BigDecimal balance =
                wallet.getBalance();

        BigDecimal withdrawAmount =
                BigDecimal.valueOf(money);


        // Check sufficient balance
        if (balance.compareTo(withdrawAmount) < 0) {

            throw new RuntimeException(
                    "Insufficient balance"
            );
        }


        // Subtract balance
        BigDecimal newBalance =
                balance.subtract(withdrawAmount);

        wallet.setBalance(newBalance);


        Wallet savedWallet =
                walletRepository.save(wallet);


        // Create withdrawal transaction
        WalletTransaction transaction =
                new WalletTransaction();

        transaction.setWallet(savedWallet);

        transaction.setType(
                WalletTransactionType.WITHDRAWAL
        );

        transaction.setDate(LocalDate.now());

        transaction.setPurpose(
                "Money withdrawn from wallet"
        );

        transaction.setAmount(money);

        walletTransactionRepository.save(transaction);


        return savedWallet;
    }


    // =========================================================
    // FIND WALLET BY ID
    // =========================================================

    @Override
    public Wallet findWalletById(Long id)
            throws Exception {

        Optional<Wallet> wallet =
                walletRepository.findById(id);

        if (wallet.isPresent()) {

            return wallet.get();
        }

        throw new Exception(
                "wallet not found"
        );
    }


    // =========================================================
    // WALLET TO WALLET TRANSFER
    // =========================================================

    @Override
    public Wallet walletToWalletTransfer(
            User sender,
            Wallet recieverWallet,
            Long amount) throws Exception {


        Wallet senderWallet =
                getUserWallet(sender);


        // Check sender balance
        if (senderWallet.getBalance()
                .compareTo(BigDecimal.valueOf(amount)) < 0) {

            throw new Exception(
                    "Insufficient balance..."
            );
        }


        // -----------------------------------------------------
        // Sender balance
        // -----------------------------------------------------

        BigDecimal senderBalance =
                senderWallet.getBalance()
                        .subtract(
                                BigDecimal.valueOf(amount)
                        );

        senderWallet.setBalance(
                senderBalance
        );

        walletRepository.save(
                senderWallet
        );


        // -----------------------------------------------------
        // Receiver balance
        // -----------------------------------------------------

        BigDecimal receiverBalance =
                recieverWallet.getBalance()
                        .add(
                                BigDecimal.valueOf(amount)
                        );

        recieverWallet.setBalance(
                receiverBalance
        );

        walletRepository.save(
                recieverWallet
        );


        // -----------------------------------------------------
        // Sender transaction
        // -----------------------------------------------------

        WalletTransaction senderTransaction =
                new WalletTransaction();

        senderTransaction.setWallet(
                senderWallet
        );

        senderTransaction.setType(
                WalletTransactionType.WALLET_TRANSFER
        );

        senderTransaction.setDate(
                LocalDate.now()
        );

        senderTransaction.setPurpose(
                "Money transferred"
        );

        senderTransaction.setAmount(
                amount
        );

        walletTransactionRepository.save(
                senderTransaction
        );


        // -----------------------------------------------------
        // Receiver transaction
        // -----------------------------------------------------

        WalletTransaction receiverTransaction =
                new WalletTransaction();

        receiverTransaction.setWallet(
                recieverWallet
        );

        receiverTransaction.setType(
                WalletTransactionType.WALLET_TRANSFER
        );

        receiverTransaction.setDate(
                LocalDate.now()
        );

        receiverTransaction.setPurpose(
                "Money received"
        );

        receiverTransaction.setAmount(
                amount
        );

        walletTransactionRepository.save(
                receiverTransaction
        );


        return senderWallet;
    }


    // =========================================================
    // PAY ORDER PAYMENT
    // =========================================================

    @Override
    public Wallet payOrderPayment(
            Order order,
            User user) throws Exception {


        Wallet wallet =
                getUserWallet(user);


        // =====================================================
        // BUY ASSET
        // =====================================================

        if (order.getOrderType()
                .equals(OrderType.BUY)) {


            // Check balance BEFORE subtracting
            if (wallet.getBalance()
                    .compareTo(order.getPrice()) < 0) {

                throw new Exception(
                        "Insufficient funds for this transaction"
                );
            }


            // Subtract order price
            BigDecimal newBalance =
                    wallet.getBalance()
                            .subtract(
                                    order.getPrice()
                            );

            wallet.setBalance(
                    newBalance
            );

            walletRepository.save(
                    wallet
            );


            // Create BUY transaction
            WalletTransaction transaction =
                    new WalletTransaction();

            transaction.setWallet(
                    wallet
            );

            transaction.setType(
                    WalletTransactionType.BUY_ASSET
            );

            transaction.setDate(
                    LocalDate.now()
            );

            transaction.setPurpose(
                    "Buy asset"
            );

            transaction.setAmount(
                    order.getPrice().longValue()
            );

            walletTransactionRepository.save(
                    transaction
            );


        }

        // =====================================================
        // SELL ASSET
        // =====================================================

        else {


            // Add order price to wallet
            BigDecimal newBalance =
                    wallet.getBalance()
                            .add(
                                    order.getPrice()
                            );

            wallet.setBalance(
                    newBalance
            );

            walletRepository.save(
                    wallet
            );


            // Create SELL transaction
            WalletTransaction transaction =
                    new WalletTransaction();

            transaction.setWallet(
                    wallet
            );

            transaction.setType(
                    WalletTransactionType.SELL_ASSET
            );

            transaction.setDate(
                    LocalDate.now()
            );

            transaction.setPurpose(
                    "Sell asset"
            );

            transaction.setAmount(
                    order.getPrice().longValue()
            );

            walletTransactionRepository.save(
                    transaction
            );
        }


        return wallet;
    }
}