package com.project.budget.controller;

import com.project.budget.entity.ApplicationDetailsEntity;
import com.project.budget.entity.AssetHistoryEntity;
import com.project.budget.entity.FiscalEntity;
import com.project.budget.repository.ApplicationDetailsRepository;
import com.project.budget.repository.AssetHistoryRepository;
import com.project.budget.repository.BranchRepository;
import com.project.budget.repository.FiscalRepository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/asset-application")
public class AssetApplicationController {

    @Autowired
    private FiscalRepository fiscalRepository;

    @Autowired
    private ApplicationDetailsRepository applicationDetailsRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private AssetHistoryRepository assetHistoryRepository;
    
   
    
    @GetMapping("/new")
    public String newApplication(Model model) {

        ApplicationDetailsEntity application = new ApplicationDetailsEntity();

        // 1️⃣ Detect current date
        LocalDate today = LocalDate.now();

        // 2️⃣ Call the repository on the instance
        FiscalEntity currentFiscal = fiscalRepository.findByDate(today); // ✅ instance method

        if (currentFiscal == null) {
            model.addAttribute("errorMessage", "No fiscal year found for current date!");
            return "asset-application";
        }
        String fiscalYear = currentFiscal.getFiscalYear();

        // 3️⃣ Get last application number
        List<String> latestNumbers = applicationDetailsRepository.findLatestApplicationNumberByFiscalYear(fiscalYear);
        int nextNumber = 1; // default if none exist
        if (!latestNumbers.isEmpty()) {
            String lastAppNumber = latestNumbers.get(0);
            String[] parts = lastAppNumber.split(" ");
            if (parts.length == 2) {
                try { 
                    nextNumber = Integer.parseInt(parts[1]) + 1; 
                } catch (NumberFormatException e) { 
                    nextNumber = 1; 
                }
            }
        }
        
        String formattedNumber = String.format("%03d", nextNumber); 


        // Set fiscalYear + next number
        application.setFiscalYear(fiscalYear);
        application.setApplicationNumber(fiscalYear+formattedNumber);

        //  Add model attributes for Thymeleaf
        model.addAttribute("applicationDetails", application);
        model.addAttribute("branches", branchRepository.findAll());
        model.addAttribute("assetApplication", new AssetHistoryEntity());

        return "asset-application";
    }



    // Save application form
    @PostMapping("/save")
    public String saveApplication(@ModelAttribute("applicationDetails") ApplicationDetailsEntity applicationDetails,
                                  Model model) {

        String errorMessage = "";

        // Manual validation
        if (applicationDetails.getApplicationNumber() == null || applicationDetails.getApplicationNumber().trim().isEmpty()) {
            errorMessage = "Application number is required.";
        } else if (applicationDetailsRepository.existsById(applicationDetails.getApplicationNumber())) {
            errorMessage = "Application number already exists.";
        } else if (applicationDetails.getToWhom() == null || applicationDetails.getToWhom().trim().isEmpty()) {
            errorMessage = "To Whom field is required.";
        } 
        // Add more field checks if needed

        if (!errorMessage.isEmpty()) {
            model.addAttribute("errorMessage", errorMessage);
            return "asset-application"; // Return to form with error
        }

        // Set reference in each AssetHistoryEntity if cascading not set
        if (applicationDetails.getAssetHistories() != null) {
            applicationDetails.getAssetHistories().forEach(item -> 
                item.setApplicationDetailsEntity(applicationDetails)
            );
        }

        // Save application details
        applicationDetailsRepository.save(applicationDetails);

        return "asset-application";
    }

    @GetMapping("/recent-orders")
    @ResponseBody
    public List<AssetHistoryEntity> getRecentOrders(@RequestParam String branchCode) {
        return assetHistoryRepository.findByBranch_BranchCode(branchCode);
    }


}
