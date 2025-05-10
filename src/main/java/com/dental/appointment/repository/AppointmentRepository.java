package com.dental.appointment.repository;

import com.dental.appointment.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    // Buscar citas por fecha ordenadas por hora
    List<Appointment> findByAppointmentDateOrderByAppointmentTimeAsc(LocalDate date);
    
    // Buscar citas por DNI ordenadas por fecha (más reciente primero)
    List<Appointment> findByDniOrderByAppointmentDateDescAppointmentTimeDesc(String dni);
}
