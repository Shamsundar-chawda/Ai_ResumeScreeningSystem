package com.example.resumescreening.service;

import com.example.resumescreening.entity.JobDescription;
import com.example.resumescreening.repository.JobDescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobDescriptionService {

    @Autowired
    private JobDescriptionRepository repository;
    
    @Autowired
    private CandidateService candidateService;

    public List<JobDescription> getAll() {
        return repository.findAll();
    }

    public JobDescription save(JobDescription jd) {
        JobDescription saved = repository.save(jd);
        candidateService.rescoreAllCandidates();
        return saved;
    }
}
