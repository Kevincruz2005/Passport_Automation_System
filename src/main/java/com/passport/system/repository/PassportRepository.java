package com.passport.system.repository;

import com.passport.system.model.Passport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PassportRepository extends JpaRepository<Passport, String> {
    Optional<Passport> findByApplication_ApplicationID(Long applicationId);
}
