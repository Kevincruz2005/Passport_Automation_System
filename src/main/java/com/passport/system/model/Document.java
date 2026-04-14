package com.passport.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long documentID;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false)
    private PassportApplication application;

    private String documentType;        // IDENTITY_PROOF, ADDRESS_PROOF, DOB_PROOF

    private String verificationStatus;  // PENDING, VERIFIED, REJECTED

    // ---- Real file storage fields ----
    private String fileName;            // original filename e.g. "aadhar.pdf"
    private String contentType;         // MIME type e.g. "application/pdf", "image/jpeg"

    @Column(name = "file_data", columnDefinition = "BYTEA")
    private byte[] fileData;            // actual file bytes stored in PostgreSQL

    private LocalDateTime uploadedAt;   // timestamp of upload

    // Getters & Setters
    public Long getDocumentID() { return documentID; }
    public void setDocumentID(Long documentID) { this.documentID = documentID; }

    public PassportApplication getApplication() { return application; }
    public void setApplication(PassportApplication application) { this.application = application; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public byte[] getFileData() { return fileData; }
    public void setFileData(byte[] fileData) { this.fileData = fileData; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}

