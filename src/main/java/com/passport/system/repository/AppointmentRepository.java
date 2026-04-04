package com.passport.system.repository;

import com.passport.system.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByApplication_ApplicationID(Long applicationId);
}
