package com.tradingapp.service;

import com.tradingapp.domain.OrderType;
import com.tradingapp.modal.Coin;
import com.tradingapp.modal.Order;
import com.tradingapp.modal.OrderItem;
import com.tradingapp.modal.User;
import java.util.List;

public interface OrderService {

    Order createOrder(User user, OrderItem orderItem, OrderType orderType);

    Order getOrderById(Long orderId) throws Exception;

    List<Order> getAllOrdersOfUser(Long userId, OrderType orderType, String assetSymbol);

    Order processOrder(Coin coin, double quantity, OrderType orderType, User user);
}
