package com.example.resumescreening.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendShortlistEmail(String toEmail, String candidateName, String jobTitle) {
        if (toEmail == null || toEmail.isEmpty() || !toEmail.contains("@")) {
            System.out.println("Invalid email address for candidate " + candidateName + ". Cannot send shortlist email.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("hr@example.com"); // Usually overridden by SMTP server
            message.setTo(toEmail);
            message.setSubject("Congratulations! You are shortlisted for " + jobTitle);
            message.setText("Dear " + candidateName + ",\n\n" +
                    "We are thrilled to inform you that your profile has been shortlisted for the " + jobTitle + " position.\n\n" +
                    "Your skills strongly align with what we are looking for. Our team will contact you shortly with the next steps.\n\n" +
                    "Best regards,\nHR Team");

            mailSender.send(message);
            System.out.println("SUCCESS: Shortlist email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("FAILED: Could not send email to " + toEmail);
            System.err.println("Reason: " + e.getMessage());
            System.err.println("Note: Ensure you have configured valid SMTP credentials in application.properties.");
        }
    }
}
