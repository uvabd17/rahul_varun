package com.linkedinlite.user.security;

import com.linkedinlite.common.dto.SessionContext;
import com.linkedinlite.common.enums.UserRole;
import com.linkedinlite.user.constants.Messages;
import com.linkedinlite.user.exception.ForbiddenException;
import com.linkedinlite.user.exception.UnauthorizedException;

/**
 * ThreadLocal store for the current request's session context. The filter
 * sets it before the controller runs and clears it in finally. Service
 * code reads it via {@link #require()} — no need to pass session state
 * through method signatures.
 */
public final class SessionHolder {

    private static final ThreadLocal<SessionContext> HOLDER = new ThreadLocal<>();

    private SessionHolder() {}

    public static void set(SessionContext ctx) {
        HOLDER.set(ctx);
    }

    public static SessionContext get() {
        return HOLDER.get();
    }

    public static void clear() {
        HOLDER.remove();
    }

    public static SessionContext require() {
        SessionContext ctx = HOLDER.get();
        if (ctx == null) throw new UnauthorizedException(Messages.MISSING_SESSION);
        return ctx;
    }

    public static void requireAdmin() {
        if (require().getRole() != UserRole.ADMIN) throw new ForbiddenException(Messages.ADMIN_ONLY);
    }
}
