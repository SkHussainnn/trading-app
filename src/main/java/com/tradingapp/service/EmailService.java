package com.tradingapp.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    public void sendVerificationOtpEmail(String email, String otp) throws MessagingException {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "utf-8");

        String subject = "NexusTrade — Your Login OTP";
        String htmlBody = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; border: 1px solid #262626; border-radius: 16px; overflow: hidden;">
                  <div style="background: linear-gradient(135deg, #06b6d4, #4f46e5); padding: 28px 32px;">
                    <h1 style="color: white; margin: 0; font-size: 22px; letter-spacing: -0.5px;">🔐 NexusTrade</h1>
                    <p style="color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px;">Secure Login Verification</p>
                  </div>
                  <div style="padding: 32px;">
                    <p style="color: #a3a3a3; font-size: 14px; margin: 0 0 20px;">Your one-time login code is:</p>
                    <div style="background: #171717; border: 2px solid #262626; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                      <span style="font-family: 'Courier New', monospace; font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #22d3ee;">""" + otp + """
                </span>
                    </div>
                    <p style="color: #737373; font-size: 12px; line-height: 1.6; margin: 0;">
                      This code expires in <strong style="color: #a3a3a3;">10 minutes</strong>.<br>
                      If you did not attempt to sign in, please <a href="#" style="color: #f87171;">secure your account</a> immediately.
                    </p>
                  </div>
                  <div style="background: #0d0d0d; border-top: 1px solid #262626; padding: 16px 32px;">
                    <p style="color: #525252; font-size: 11px; margin: 0;">© 2026 NexusTrade Exchange · Do not reply to this email</p>
                  </div>
                </div>
                """;

        helper.setSubject(subject);
        helper.setText(htmlBody, true); // true = HTML
        helper.setTo(email);
        helper.setFrom("noreply@nexustrade.io");

        try {
            javaMailSender.send(mimeMessage);
        } catch (MailException e) {
            throw new MailSendException(e.getMessage());
        }
    }
}
