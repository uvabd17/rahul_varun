package com.linkedinlite.connection.security;

import com.linkedinlite.common.dto.SessionContext;
import com.linkedinlite.common.enums.UserRole;
import com.linkedinlite.connection.exception.ForbiddenException;
import com.linkedinlite.connection.exception.UnauthorizedException;

public final class SessionHolder {

    private static final ThreadLocal<SessionContext> HOLDER = new ThreadLocal<>();

    private SessionHolder() {}

    public static void set(SessionContext ctx)  { HOLDER.set(ctx); }
    public static SessionContext get()          { return HOLDER.get(); }
    public static void clear()                  { HOLDER.remove(); }

    public static SessionContext require() {
        SessionContext ctx = HOLDER.get();
        if (ctx == null) throw new UnauthorizedException("Missing or invalid session");
        return ctx;
    }

    public static void requireAdmin() {
        if (require().getRole() != UserRole.ADMIN) throw new ForbiddenException("Admin access required");
    }
}
