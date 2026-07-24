package com.linkedinlite.connection.controller;

import com.linkedinlite.common.dto.ApiResponse;
import com.linkedinlite.connection.constants.ApiPaths;
import com.linkedinlite.connection.constants.Messages;
import com.linkedinlite.connection.dto.request.SendConnectionRequest;
import com.linkedinlite.connection.dto.response.ConnectionReport;
import com.linkedinlite.connection.dto.response.ConnectionResponse;
import com.linkedinlite.connection.service.ConnectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.CONNECTIONS_BASE)
@RequiredArgsConstructor
public class ConnectionController {

    private final ConnectionService svc;

    @PostMapping(ApiPaths.REQUEST)
    public ResponseEntity<ApiResponse<ConnectionResponse>> send(@Valid @RequestBody SendConnectionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(svc.send(req), Messages.REQUEST_SENT));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConnectionResponse>>> mine() {
        return ResponseEntity.ok(ApiResponse.ok(svc.myAccepted()));
    }

    @GetMapping(ApiPaths.PENDING)
    public ResponseEntity<ApiResponse<List<ConnectionResponse>>> pending() {
        return ResponseEntity.ok(ApiResponse.ok(svc.incomingPending()));
    }

    @PatchMapping(ApiPaths.ACCEPT)
    public ResponseEntity<ApiResponse<ConnectionResponse>> accept(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(svc.accept(id), Messages.REQUEST_ACCEPTED));
    }

    @PatchMapping(ApiPaths.REJECT)
    public ResponseEntity<ApiResponse<ConnectionResponse>> reject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(svc.reject(id), Messages.REQUEST_REJECTED));
    }

    @DeleteMapping(ApiPaths.BY_ID)
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long id) {
        svc.remove(id);
        return ResponseEntity.ok(ApiResponse.ok(null, Messages.REMOVED));
    }

    @GetMapping(ApiPaths.REPORTS)
    public ResponseEntity<ApiResponse<ConnectionReport>> reports() {
        return ResponseEntity.ok(ApiResponse.ok(svc.reports()));
    }
}
