package com.example.resumescreening.service;

import com.example.resumescreening.entity.Candidate;
import com.example.resumescreening.entity.JobDescription;
import com.example.resumescreening.repository.CandidateRepository;
import com.example.resumescreening.repository.JobDescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class CandidateService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobDescriptionRepository jobDescriptionRepository;

    @Autowired
    private ResumeParserService resumeParserService;

    @Autowired
    private ScoringService scoringService;

    @Autowired
    private EmailService emailService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public Candidate processAndSaveResume(MultipartFile file, String name) throws IOException {
        // Save file locally
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);
        Files.write(filePath, file.getBytes());

        // Parse resume
        String text = resumeParserService.extractText(file);
        String email = resumeParserService.extractEmail(text);
        String skills = resumeParserService.extractSkills(text);
        String experience = resumeParserService.extractExperience(text);

        // Score against the first job description if exists
        Double score = 0.0;
        String skillGaps = "";
        List<JobDescription> jds = jobDescriptionRepository.findAll();
        if (!jds.isEmpty()) {
            JobDescription jd = jds.get(0);
            score = scoringService.calculateScore(skills, jd.getRequiredSkills());
            skillGaps = scoringService.findSkillGaps(skills, jd.getRequiredSkills());
        }

        String aiSummary = resumeParserService.generateSummary(text, skills, experience);

        Candidate candidate = new Candidate();
        candidate.setName(name);
        candidate.setEmail(email);
        candidate.setSkills(skills);
        candidate.setExperience(experience);
        candidate.setResumePath(filePath.toString());
        candidate.setScore(score);
        candidate.setSkillGaps(skillGaps);
        candidate.setAiSummary(aiSummary);
        candidate.setStatus(score >= 60.0 ? "Shortlisted" : "New");

        Candidate savedCandidate = candidateRepository.save(candidate);

        // Send email if score >= 60% and email hasn't been sent
        if (savedCandidate.getScore() != null && savedCandidate.getScore() >= 60.0 && !savedCandidate.isShortlistedEmailSent()) {
            String jobTitle = jds.isEmpty() ? "the open position" : jds.get(0).getTitle();
            emailService.sendShortlistEmail(savedCandidate.getEmail(), savedCandidate.getName(), jobTitle);
            savedCandidate.setShortlistedEmailSent(true);
            savedCandidate = candidateRepository.save(savedCandidate);
        }

        return savedCandidate;
    }

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public void deleteCandidate(Long id) {
        candidateRepository.deleteById(id);
    }

    public Optional<Candidate> findById(Long id) {
        return candidateRepository.findById(id);
    }

    public Candidate saveCandidate(Candidate candidate) {
        return candidateRepository.save(candidate);
    }
    
    public void rescoreAllCandidates() {
        List<Candidate> candidates = candidateRepository.findAll();
        List<JobDescription> jds = jobDescriptionRepository.findAll();
        if (!jds.isEmpty()) {
            JobDescription jd = jds.get(0);
            for (Candidate c : candidates) {
                c.setScore(scoringService.calculateScore(c.getSkills(), jd.getRequiredSkills()));
                c.setSkillGaps(scoringService.findSkillGaps(c.getSkills(), jd.getRequiredSkills()));
                
                // Auto-update status if currently 'New'
                if ("New".equals(c.getStatus()) && c.getScore() != null && c.getScore() >= 60.0) {
                    c.setStatus("Shortlisted");
                }
                
                // Send email if newly shortlisted
                if (c.getScore() != null && c.getScore() >= 60.0 && !c.isShortlistedEmailSent()) {
                    emailService.sendShortlistEmail(c.getEmail(), c.getName(), jd.getTitle());
                    c.setShortlistedEmailSent(true);
                }
                
                candidateRepository.save(c);
            }
        }
    }
}
