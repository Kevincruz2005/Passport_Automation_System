package com.passport.system.repository;

import com.passport.system.model.PassportApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<PassportApplication, Long> {
    List<PassportApplication> findByApplicant_UserID(Long applicantId);
}
