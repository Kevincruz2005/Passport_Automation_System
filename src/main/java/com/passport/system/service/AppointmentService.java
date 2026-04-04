package com.passport.system.service;

import com.passport.system.model.Appointment;
import com.passport.system.model.PassportApplication;
import com.passport.system.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ApplicationService applicationService;

    public Appointment scheduleAppointment(Long applicationId, LocalDateTime dateTime, String notes) {
        PassportApplication app = applicationService.getApplicationById(applicationId);

        Appointment appointment = new Appointment();
        appointment.setApplication(app);
        appointment.setAppointmentDateTime(dateTime);
        appointment.setNotes(notes != null ? notes : "Bring originals of all uploaded documents.");
        appointment.setStatus("SCHEDULED");

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsByApplication(Long applicationId) {
        return appointmentRepository.findByApplication_ApplicationID(applicationId);
    }
}
