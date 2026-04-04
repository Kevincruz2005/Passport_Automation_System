package com.passport.system.controller;

import com.passport.system.model.Document;
import com.passport.system.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    /**
     * Real multipart upload endpoint.
     * Frontend sends: multipart/form-data with fields: applicationId, documentType, file
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(
            @RequestParam("applicationId") Long applicationId,
            @RequestParam("documentType") String documentType,
            @RequestPart("file") MultipartFile file) {
        try {
            Document saved = documentService.uploadDocument(applicationId, documentType, file);
            // Return metadata only (no raw bytes) for clean JSON response
            return ResponseEntity.ok(Map.of(
                "documentID", saved.getDocumentID(),
                "documentType", saved.getDocumentType(),
                "fileName", saved.getFileName(),
                "contentType", saved.getContentType(),
                "verificationStatus", saved.getVerificationStatus(),
                "uploadedAt", saved.getUploadedAt().toString()
            ));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "File upload failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Returns document metadata list for an application (no file bytes in response).
     */
    @GetMapping("/{applicationID}")
    public ResponseEntity<List<Document>> getDocuments(@PathVariable Long applicationID) {
        List<Document> docs = documentService.getDocumentsByApplication(applicationID);
        // Null out fileData to avoid sending BLOBs in list view
        docs.forEach(d -> d.setFileData(null));
        return ResponseEntity.ok(docs);
    }

    /**
     * Download / preview the actual file bytes for a document.
     * Officers call this to open/review the uploaded file.
     */
    @GetMapping("/{documentID}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long documentID) {
        Document doc = documentService.getDocumentById(documentID);
        if (doc.getFileData() == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + doc.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(
                        doc.getContentType() != null ? doc.getContentType() : "application/octet-stream"))
                .body(doc.getFileData());
    }

    /**
     * Officer verifies a document — marks it VERIFIED or REJECTED.
     */
    @PutMapping("/{documentID}/verify")
    public ResponseEntity<Document> verifyDocument(
            @PathVariable Long documentID,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        Document doc = documentService.verifyDocument(documentID, status);
        doc.setFileData(null); // strip bytes from response
        return ResponseEntity.ok(doc);
    }
}

