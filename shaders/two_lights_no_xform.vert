void main()
{
	gl_Position = gl_Vertex;
	vec3 normal = normalize(gl_NormalMatrix * gl_Normal); // eye space
	gl_FrontColor = gl_Color * gl_LightModel.ambient;
	if (enable_light0) gl_FrontColor += add_light_comp(normal, 0);
	if (enable_light1) gl_FrontColor += add_light_comp(normal, 1);
} 
