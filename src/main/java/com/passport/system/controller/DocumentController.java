package com.passport.system.controller;

import com.passport.system.model.Document;
import com.passport.system.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping
    public ResponseEntity<Document> uploadDocument(@RequestBody Document document) {
        return ResponseEntity.ok(documentService.uploadDocument(document));
    }

    @GetMapping("/{applicationID}")
    public ResponseEntity<List<Document>> getDocuments(@PathVariable Long applicationID) {
        return ResponseEntity.ok(documentService.getDocumentsByApplication(applicationID));
    }

    @PutMapping("/{documentID}/verify")
    public ResponseEntity<Document> verifyDocument(@PathVariable Long documentID, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return ResponseEntity.ok(documentService.verifyDocument(documentID, status));
    }
}
