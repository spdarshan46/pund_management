package com.pundmanagement.pundmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pundmanagement.pundmanagement.entity.TestEntity;

public interface TestRepository extends JpaRepository<TestEntity, Long> {
}
