package com.project.budget.repository;

import com.project.budget.entity.AssetHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetHistoryRepository extends JpaRepository<AssetHistoryEntity, Long> {

	List<AssetHistoryEntity> findByBranch_BranchCode(String branchCode);

}
