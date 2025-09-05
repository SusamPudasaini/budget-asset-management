package com.project.budget.repository;

import com.project.budget.entity.ApplicationDetailsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationDetailsRepository extends JpaRepository<ApplicationDetailsEntity, String> {

    // Fetch last application number for a fiscal year
    @Query("SELECT a.applicationNumber FROM ApplicationDetailsEntity a WHERE a.fiscalYear = :fiscalYear ORDER BY a.applicationNumber DESC")
    List<String> findLatestApplicationNumberByFiscalYear(@Param("fiscalYear") String fiscalYear);
}
