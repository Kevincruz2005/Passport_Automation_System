package com.passport.system.repository;

import com.passport.system.model.PoliceVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PoliceVerificationRepository extends JpaRepository<PoliceVerification, Long> {
    List<PoliceVerification> findByApplication_ApplicationID(Long applicationId);
    List<PoliceVerification> findByStatus(String status);
}
