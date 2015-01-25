uniform vec3 planet_pos, sun_pos, camera_pos;
uniform float planet_radius, ring_ri, ring_ro, sun_radius, bf_draw_sign;
uniform float alpha_scale = 1.0;
uniform sampler2D noise_tex, particles_tex;
uniform sampler1D ring_tex;

in vec3 normal, world_space_pos, vertex;
in vec2 tc;


vec3 add_light_rings(in vec3 n, in vec4 epos) {
	vec3 color     = vec3(1.0); // always white - color comes from texture
	vec3 light_dir = normalize(fg_LightSource[0].position.xyz - epos.xyz); // normalize the light's direction in eye space
	vec3 diffuse   = color * fg_LightSource[0].diffuse.rgb;
	vec3 ambient0  = color * fg_LightSource[0].ambient.rgb;
	vec3 ambient1  = color * fg_LightSource[1].ambient.rgb; // ambient only
	vec3 specular  = get_light_specular(n, light_dir, epos.xyz, fg_LightSource[0].specular.rgb);
	float atten    = calc_light_atten0(epos);
	if (sun_radius > 0.0) {atten *= calc_sphere_shadow_atten(world_space_pos, sun_pos, sun_radius, planet_pos, planet_radius);} // sun exists
	return (ambient0 + ambient1 + (abs(dot(n, light_dir))*diffuse + specular)) * atten;
}

void main()
{
	if (bf_draw_sign*(length(world_space_pos - camera_pos) - length(planet_pos - camera_pos)) < 0.0) discard; // on the wrong side of the planet

	float rval = clamp((length(vertex) - ring_ri)/(ring_ro - ring_ri), 0.0, 1.0);
	vec4 texel = texture(ring_tex, rval);
	texel.a   *= alpha_scale;
	if (texel.a < 0.01) discard;

	// alpha lower when viewing edge
	vec4 epos   = fg_ModelViewMatrix * vec4(vertex, 1.0);
	texel.a    *= pow(abs(dot(normal, normalize(epos.xyz))), 0.2); // 5th root
	vec2 tcs    = 16*tc;
	vec3 norm2  = normalize(normal + vec3(texture(noise_tex, tcs).r-0.5, texture(noise_tex, tcs+vec2(0.4,0.7)).r-0.5, texture(noise_tex, tcs+vec2(0.3,0.8)).r-0.5));
	vec3 color  = add_light_rings(norm2, epos); // ambient, diffuse, and specular
	float alpha = texture(particles_tex, 23 *tc).r; // add 4 octaves of random particles
	alpha      += texture(particles_tex, 42 *tc).r;
	alpha      += texture(particles_tex, 75 *tc).r;
	alpha      += texture(particles_tex, 133*tc).r;
	if (alpha == 0.0) discard;
	alpha       = min(1.0, 2.0*alpha); // increase alpha to make alpha_to_coverage mode look better
	fg_FragColor = vec4(color, alpha) * texel;
}
