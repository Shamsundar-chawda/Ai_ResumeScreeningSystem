package com.example.resumescreening.controller;

import com.example.resumescreening.entity.Candidate;
import com.example.resumescreening.entity.JobDescription;
import com.example.resumescreening.service.CandidateService;
import com.example.resumescreening.service.JobDescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ResumeController {

    @Autowired
    private CandidateService candidateService;

    @Autowired
    private JobDescriptionService jobDescriptionService;

    @PostMapping("/uploadResume")
    public ResponseEntity<Candidate> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name) {
        try {
            Candidate saved = candidateService.processAndSaveResume(file, name);
            return new ResponseEntity<>(saved, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/candidates")
    public ResponseEntity<List<Candidate>> getCandidates() {
        return new ResponseEntity<>(candidateService.getAllCandidates(), HttpStatus.OK);
    }

    @GetMapping("/rankCandidates")
    public ResponseEntity<List<Candidate>> getRankedCandidates() {
        List<Candidate> sorted = candidateService.getAllCandidates().stream()
                .sorted(Comparator.comparing(Candidate::getScore).reversed())
                .collect(Collectors.toList());
        return new ResponseEntity<>(sorted, HttpStatus.OK);
    }

    @DeleteMapping("/candidates/{id}")
    public ResponseEntity<Void> deleteCandidate(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/jobDescription")
    public ResponseEntity<List<JobDescription>> getJobDescriptions() {
        return new ResponseEntity<>(jobDescriptionService.getAll(), HttpStatus.OK);
    }

    @PostMapping("/jobDescription")
    public ResponseEntity<JobDescription> saveJobDescription(@RequestBody JobDescription jd) {
        return new ResponseEntity<>(jobDescriptionService.save(jd), HttpStatus.OK);
    }

    @PutMapping("/candidates/{id}/status")
    public ResponseEntity<Candidate> updateCandidateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Candidate> opt = candidateService.findById(id);
        if (opt.isPresent()) {
            Candidate c = opt.get();
            c.setStatus(newStatus);
            candidateService.saveCandidate(c);
            return ResponseEntity.ok(c);
        }
        return ResponseEntity.notFound().build();
    }
}
