package com.example.resumescreening.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ResumeParserService {

    private static final List<String> KNOWN_SKILLS = Arrays.asList(
            "java", "python", "react", "spring boot", "mysql", "javascript", "html", "css", 
            "c++", "angular", "node.js", "docker", "kubernetes", "aws", "git", "machine learning",
            "nlp", "data science", "sql", "mongodb", "php", "ruby"
    );

    public String extractText(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if (fileName == null) return "";

        try (InputStream is = file.getInputStream()) {
            if (fileName.toLowerCase().endsWith(".pdf")) {
                try (PDDocument document = PDDocument.load(is)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(document);
                }
            } else if (fileName.toLowerCase().endsWith(".docx")) {
                try (XWPFDocument document = new XWPFDocument(is);
                     XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
                    return extractor.getText();
                }
            } else if (fileName.toLowerCase().endsWith(".txt")) {
                return new String(is.readAllBytes());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    public String extractEmail(String text) {
        Matcher m = Pattern.compile("[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+").matcher(text);
        if (m.find()) {
            return m.group();
        }
        return "Not Found";
    }

    public String extractSkills(String text) {
        String lowerText = text.toLowerCase();
        Set<String> foundSkills = new HashSet<>();
        
        for (String skill : KNOWN_SKILLS) {
            if (lowerText.contains(skill)) {
                foundSkills.add(skill);
            }
        }
        return String.join(", ", foundSkills);
    }
    
    public String extractExperience(String text) {
        // Simple heuristic to extract experience
        Matcher m = Pattern.compile("(\\d+)\\+?\\s*(years?|yrs?)\\s*(of)?\\s*experience", Pattern.CASE_INSENSITIVE).matcher(text);
        if (m.find()) {
            return m.group(1) + " years";
        }
        return "Not Specified";
    }

    public String generateSummary(String text, String skills, String experience) {
        // Heuristic AI-like summary generation based on extracted text
        String summary = "A candidate with background in " + (skills.isEmpty() ? "various technologies" : skills) + ". ";
        if (!"Not Specified".equals(experience)) {
            summary += "Brings " + experience + " of professional experience. ";
        } else {
            summary += "Experience level is unspecified or entry-level. ";
        }
        
        // Extract a few sentences from the resume text to add context
        String[] sentences = text.replaceAll("\\s+", " ").split("\\.");
        if (sentences.length > 2) {
            String context = sentences[0].trim() + ". " + sentences[1].trim() + ".";
            // Make sure it doesn't exceed reasonable length
            if (context.length() > 200) {
                context = context.substring(0, 197) + "...";
            }
            summary += "Profile highlights: " + context;
        }
        
        return summary;
    }
}
