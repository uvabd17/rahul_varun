package com.linkedinlite.user.config;

import com.linkedinlite.common.constants.HttpHeaders;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SESSION_SCHEME = "SessionHeader";

    @Bean
    public OpenAPI apiInfo() {
        // Declares the X-Session-Id header so Swagger UI has an Authorize dialog.
        return new OpenAPI()
                .info(new Info()
                        .title("user-service API")
                        .version("v1")
                        .description("Auth, users, profiles."))
                .addSecurityItem(new SecurityRequirement().addList(SESSION_SCHEME))
                .components(new Components().addSecuritySchemes(SESSION_SCHEME,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name(HttpHeaders.SESSION_ID)));
    }
}
