package com.linkedinlite.post.exception;

import com.linkedinlite.common.constants.ErrorCodes;
import com.linkedinlite.common.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException ex) {
        List<ErrorResponse.FieldError> fields = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> ErrorResponse.FieldError.builder()
                        .field(f.getField()).message(f.getDefaultMessage()).build())
                .toList();
        return build(HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_FAILED, "Validation failed", fields);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ErrorCodes.RESOURCE_NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> unauth(UnauthorizedException ex) {
        return build(HttpStatus.UNAUTHORIZED, ErrorCodes.UNAUTHORIZED, ex.getMessage(), null);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> forbidden(ForbiddenException ex) {
        return build(HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN, ex.getMessage(), null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> other(Exception ex) {
        log.error("Unhandled exception", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.INTERNAL_ERROR, "Something went wrong", null);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus s, String code, String msg,
                                                List<ErrorResponse.FieldError> fields) {
        return ResponseEntity.status(s).body(
                ErrorResponse.builder()
                        .success(false).code(code).message(msg)
                        .fieldErrors(fields).timestamp(Instant.now()).build()
        );
    }
}
