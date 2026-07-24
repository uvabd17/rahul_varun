package com.linkedinlite.common.constants;

/**
 * Non-standard headers every service agrees on. Keeps the string
 * "X-Session-Id" out of code so a rename is one place.
 */
public final class HttpHeaders {

    public static final String SESSION_ID = "X-Session-Id";

    private HttpHeaders() {}
}
