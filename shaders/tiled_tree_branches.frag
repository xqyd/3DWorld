uniform sampler2D tex0;
uniform float opacity = 1.0;

varying vec4 epos;
varying vec3 normal;
varying vec2 tc;

void main()
{
	check_noise_and_maybe_discard((1.0 - opacity), 1.0); // inverted value
	vec4 texel   = texture2D(tex0, tc);
	vec3 normal2 = normalize(normal); // renormalize
	vec4 color   = gl_FrontMaterial.emission + gl_FrontMaterial.ambient * gl_LightModel.ambient;
	if (enable_light0) color += add_light_comp_pos0(normal2, epos); // sun
	if (enable_light1) color += add_light_comp_pos1(normal2, epos); // moon
	if (enable_light2) color += add_light_comp_pos (normal2, epos, 2) * calc_light_atten(epos, 2); // lightning
	gl_FragColor = apply_fog_epos(texel*color, epos);
}
