package com.passport.system.service;

import com.passport.system.model.ApplicationStatus;
import com.passport.system.model.Document;
import com.passport.system.model.PassportApplication;
import com.passport.system.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private ApplicationService applicationService;

    public Document uploadDocument(Document document) {
        document.setVerificationStatus("PENDING");
        Document saved = documentRepository.save(document);
        
        PassportApplication app = document.getApplication();
        if (app != null && app.getStatus() == ApplicationStatus.SUBMITTED) {
            applicationService.updateStatus(app.getApplicationID(), ApplicationStatus.DOCUMENTS_UPLOADED);
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
}
