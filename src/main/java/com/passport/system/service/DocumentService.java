package com.passport.system.service;

import com.passport.system.model.ApplicationStatus;
import com.passport.system.model.Document;
import com.passport.system.model.PassportApplication;

import com.passport.system.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private ApplicationService applicationService;


    /**
     * Uploads a real document file and persists its bytes to the database.
     * Triggers the application status bump from SUBMITTED to DOCUMENTS_UPLOADED.
     */
    public Document uploadDocument(Long applicationId, String documentType, MultipartFile file) throws IOException {
        PassportApplication app = applicationService.getApplicationById(applicationId);

        Document document = new Document();
        document.setApplication(app);
        document.setDocumentType(documentType);
        document.setVerificationStatus("PENDING");
        document.setFileName(file.getOriginalFilename());
        document.setContentType(file.getContentType());
        document.setFileData(file.getBytes());
        document.setUploadedAt(LocalDateTime.now());

        Document saved = documentRepository.save(document);

        // Bump status only if still at SUBMITTED
        if (app.getStatus() == ApplicationStatus.SUBMITTED) {
            applicationService.updateStatus(applicationId, ApplicationStatus.DOCUMENTS_UPLOADED);
        }

        return saved;
    }

    public List<Document> getDocumentsByApplication(Long applicationId) {
        return documentRepository.findByApplication_ApplicationID(applicationId);
    }

    public Document verifyDocument(Long documentId, String status) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        doc.setVerificationStatus(status);
        return documentRepository.save(doc);
    }

    public Document getDocumentById(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }
}

