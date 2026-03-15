package com.passport.system.controller;

import com.passport.system.model.Payment;
import com.passport.system.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> processPayment(@RequestBody Payment payment, @RequestParam(defaultValue = "true") boolean simulateSuccess) {
        return ResponseEntity.ok(paymentService.processPayment(payment, simulateSuccess));
    }

    @GetMapping("/{applicationID}")
    public ResponseEntity<List<Payment>> getPayments(@PathVariable Long applicationID) {
        return ResponseEntity.ok(paymentService.getPaymentsByApplication(applicationID));
    }
}
