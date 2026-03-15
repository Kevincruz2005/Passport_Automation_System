package com.passport.system.service;

import com.passport.system.model.ApplicationStatus;
import com.passport.system.model.Payment;
import com.passport.system.model.PassportApplication;
import com.passport.system.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ApplicationService applicationService;

    public Payment processPayment(Payment payment, boolean simulateSuccess) {
        payment.setDate(LocalDateTime.now());
        payment.setStatus(simulateSuccess ? "SUCCESS" : "FAILED");
        Payment saved = paymentRepository.save(payment);

        PassportApplication app = payment.getApplication();
        if (app != null) {
            ApplicationStatus newStatus = simulateSuccess ? ApplicationStatus.PAYMENT_CONFIRMED : ApplicationStatus.PAYMENT_FAILED;
            applicationService.updateStatus(app.getApplicationID(), newStatus);
        }
        
        return saved;
    }

    public List<Payment> getPaymentsByApplication(Long applicationId) {
        return paymentRepository.findByApplication_ApplicationID(applicationId);
    }
}
