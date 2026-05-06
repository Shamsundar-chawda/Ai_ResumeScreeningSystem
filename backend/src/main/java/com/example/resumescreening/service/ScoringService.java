package com.example.resumescreening.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ScoringService {

    public Double calculateScore(String resumeSkills, String requiredSkills) {
        if (requiredSkills == null || requiredSkills.trim().isEmpty()) {
            return 0.0;
        }
        if (resumeSkills == null || resumeSkills.trim().isEmpty()) {
            return 0.0;
        }

        Set<String> reqSkillsSet = Arrays.stream(requiredSkills.toLowerCase().split(","))
                .map(String::trim)
                .collect(Collectors.toSet());

        Set<String> resSkillsSet = Arrays.stream(resumeSkills.toLowerCase().split(","))
                .map(String::trim)
                .collect(Collectors.toSet());

        if (reqSkillsSet.isEmpty()) return 0.0;

        long matchCount = resSkillsSet.stream()
                .filter(reqSkillsSet::contains)
                .count();

        return ((double) matchCount / reqSkillsSet.size()) * 100.0;
    }

    public String findSkillGaps(String resumeSkills, String requiredSkills) {
        if (requiredSkills == null || requiredSkills.trim().isEmpty()) {
            return "";
        }
        
        Set<String> reqSkillsSet = Arrays.stream(requiredSkills.toLowerCase().split(","))
                .map(String::trim)
                .collect(Collectors.toSet());

        if (resumeSkills == null || resumeSkills.trim().isEmpty()) {
            return String.join(", ", reqSkillsSet);
        }

        Set<String> resSkillsSet = Arrays.stream(resumeSkills.toLowerCase().split(","))
                .map(String::trim)
                .collect(Collectors.toSet());

        Set<String> missingSkills = reqSkillsSet.stream()
                .filter(req -> !resSkillsSet.contains(req))
                .collect(Collectors.toSet());

        return String.join(", ", missingSkills);
    }
}
