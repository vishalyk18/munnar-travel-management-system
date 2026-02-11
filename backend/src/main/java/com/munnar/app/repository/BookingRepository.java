package com.munnar.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.munnar.app.model.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
}
