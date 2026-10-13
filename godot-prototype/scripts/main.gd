extends Node3D

const JoystickScript = preload("res://scripts/virtual_joystick.gd")
const MOVE_SPEED := 4.2
const JUMP_SPEED := 5.4
const GRAVITY := 15.0

var hero: CharacterBody3D
var camera: Camera3D
var joystick: VirtualJoystick
var status_label: Label
var hint_label: Label
var dialogue_label: Label
var _queued_action := ""
var _time := 0.0
var _collected := false
var _parts: Dictionary = {}
var _materials: Dictionary = {}

func _ready() -> void:
	_build_materials()
	_build_environment()
	_build_world()
	_build_hero()
	_build_camera()
	_build_hud()
	_show_line("RELIC HERO", "The trail starts here. Let's find the treasure!")
	_update_status("Explore the jungle and find the glowing treasure.")

func _process(delta: float) -> void:
	_time += delta
	if is_instance_valid(hero) and is_instance_valid(camera):
		var target := hero.global_position + Vector3(0.0, 4.1, 9.0)
		camera.global_position = camera.global_position.lerp(target, minf(delta * 3.6, 1.0))
		camera.look_at(hero.global_position + Vector3(0.0, 1.0, 0.0), Vector3.UP)
		_animate_hero()
		_check_treasure()

func _physics_process(delta: float) -> void:
	if not is_instance_valid(hero):
		return
	var keyboard_axis := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	var move_axis := keyboard_axis
	if joystick and joystick.axis.length() > move_axis.length():
		move_axis = joystick.axis
	var direction := Vector3(move_axis.x, 0.0, move_axis.y)
	hero.velocity.x = direction.x * MOVE_SPEED
	hero.velocity.z = direction.z * MOVE_SPEED
	if direction.length() > 0.1:
		hero.rotation.y = lerp_angle(hero.rotation.y, atan2(direction.x, direction.z), minf(delta * 10.0, 1.0))
	if not hero.is_on_floor():
		hero.velocity.y -= GRAVITY * delta
	elif hero.velocity.y < 0.0:
		hero.velocity.y = 0.0
	if _queued_action == "jump" and hero.is_on_floor():
		hero.velocity.y = JUMP_SPEED
	if _queued_action != "":
		_run_action(_queued_action)
		_queued_action = ""
	hero.move_and_slide()

func _build_materials() -> void:
	_materials = {
		"jungle": _mat(Color("#244b38"), 0.96),
		"leaf": _mat(Color("#477b4a"), 0.9),
		"leaf_light": _mat(Color("#78a85d"), 0.9),
		"wood": _mat(Color("#68412c"), 0.88),
		"stone": _mat(Color("#606a57"), 0.95),
		"stone_light": _mat(Color("#909579"), 0.9),
		"gold": _mat(Color("#f1c45f"), 0.55, 0.12),
		"skin": _mat(Color("#bd8058"), 0.82),
		"hair": _mat(Color("#38251f"), 0.92),
		"jacket": _mat(Color("#287b69"), 0.8),
		"scarf": _mat(Color("#e87845"), 0.72),
		"trousers": _mat(Color("#4b3b34"), 0.9),
		"boots": _mat(Color("#30231e"), 0.88),
		"eye": _mat(Color("#241b17"), 0.5),
		"white": _mat(Color("#fff4dc"), 0.38),
		"relic": _mat(Color("#8de9d0"), 0.28, 1.0)
	}

func _mat(color: Color, roughness: float = 0.82, emission: float = 0.0) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = roughness
	if emission > 0.0:
		material.emission_enabled = true
		material.emission = color
		material.emission_energy_multiplier = emission
	return material

func _build_environment() -> void:
	var world_env := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#9bc8d1")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#d3e4c7")
	environment.ambient_light_energy = 0.78
	world_env.environment = environment
	add_child(world_env)
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-48.0, -28.0, 0.0)
	sun.light_energy = 1.35
	sun.shadow_enabled = true
	add_child(sun)

func _build_world() -> void:
	_add_box(self, "Jungle Ground", Vector3(36.0, 0.7, 20.0), Vector3(0.0, -0.38, 0.0), "jungle", true)
	_add_box(self, "Ancient Path", Vector3(22.0, 0.08, 3.4), Vector3(0.0, 0.02, 0.0), "stone", false)
	for i in range(11):
		var x := -10.0 + float(i) * 2.0
		_add_tree(Vector3(x, 0.0, -4.3 - float(i % 3) * 0.7), 1.0 + float(i % 3) * 0.13)
		if i % 2 == 0:
			_add_tree(Vector3(x + 0.7, 0.0, 4.2 + float(i % 2)), 0.84 + float(i % 3) * 0.12)
	for i in range(7):
		var x := -6.0 + float(i) * 2.2
		_add_box(self, "Ancient Ruin %02d" % i, Vector3(0.7, 1.0 + float(i % 3) * 0.42, 0.8), Vector3(x, 0.5 + float(i % 3) * 0.21, -1.6), "stone", true)
	_add_box(self, "Treasure Pedestal", Vector3(1.1, 0.62, 1.1), Vector3(6.4, 0.31, 0.0), "stone_light", true)
	_add_box(self, "Treasure Chest", Vector3(0.95, 0.62, 0.78), Vector3(6.4, 0.93, 0.0), "wood", false)
	_add_box(self, "Chest Gold Band", Vector3(1.0, 0.66, 0.12), Vector3(6.4, 0.93, 0.39), "gold", false)
	_add_box(self, "Treasure Lid", Vector3(0.98, 0.18, 0.8), Vector3(6.4, 1.31, 0.0), "gold", false)
	var relic := _add_sphere(self, "Glowing Relic", 0.28, Vector3(6.4, 1.68, 0.0), "relic")
	relic.name = "Glowing Relic"
	for i in range(6):
		var rock_x := -8.0 + float(i) * 2.8
		_add_sphere(self, "Jungle Boulder %02d" % i, 0.5 + float(i % 2) * 0.18, Vector3(rock_x, 0.35, 3.1), "stone")

func _add_tree(position: Vector3, scale_factor: float) -> void:
	var tree := Node3D.new()
	tree.position = position
	tree.scale = Vector3.ONE * scale_factor
	add_child(tree)
	_add_cylinder(tree, "Trunk", 0.22, 2.5, Vector3(0.0, 1.25, 0.0), "wood")
	_add_sphere(tree, "Canopy", 1.05, Vector3(0.0, 2.8, 0.0), "leaf")
	_add_sphere(tree, "Canopy Highlight", 0.62, Vector3(0.34, 3.02, 0.0), "leaf_light")

func _build_hero() -> void:
	hero = CharacterBody3D.new()
	hero.name = "RelicHero"
	hero.position = Vector3(-7.0, 0.08, 0.0)
	add_child(hero)
	var collision := CollisionShape3D.new()
	var capsule := CapsuleShape3D.new()
	capsule.radius = 0.32
	capsule.height = 1.78
	collision.shape = capsule
	collision.position.y = 0.9
	hero.add_child(collision)
	_add_capsule(hero, "Body", 0.31, 0.9, Vector3(0.0, 1.08, 0.0), "jacket")
	_add_sphere(hero, "Head", 0.43, Vector3(0.0, 1.92, 0.0), "skin")
	_add_sphere(hero, "Hair", 0.41, Vector3(0.0, 2.16, -0.08), "hair").scale = Vector3(1.0, 0.48, 0.95)
	_add_box(hero, "Backpack", Vector3(0.5, 0.62, 0.28), Vector3(0.0, 1.18, -0.34), "wood", false)
	_add_box(hero, "Pack Roll", Vector3(0.48, 0.13, 0.31), Vector3(0.0, 1.51, -0.35), "gold", false)
	_add_torus(hero, "Adventure Scarf", 0.34, 0.09, Vector3(0.0, 1.57, 0.0), "scarf")
	_add_capsule(hero, "Left Arm", 0.105, 0.65, Vector3(-0.39, 1.19, 0.0), "skin")
	_add_capsule(hero, "Right Arm", 0.105, 0.65, Vector3(0.39, 1.19, 0.0), "skin")
	_add_capsule(hero, "Left Leg", 0.12, 0.65, Vector3(-0.17, 0.45, 0.02), "trousers")
	_add_capsule(hero, "Right Leg", 0.12, 0.65, Vector3(0.17, 0.45, 0.02), "trousers")
	_add_sphere(hero, "Left Boot", 0.19, Vector3(-0.18, 0.17, 0.12), "boots")
	_add_sphere(hero, "Right Boot", 0.19, Vector3(0.18, 0.17, 0.12), "boots")
	_add_sphere(hero, "Left Eye", 0.055, Vector3(-0.14, 1.99, 0.36), "white")
	_add_sphere(hero, "Right Eye", 0.055, Vector3(0.14, 1.99, 0.36), "white")
	_add_sphere(hero, "Left Pupil", 0.026, Vector3(-0.14, 1.99, 0.405), "eye")
	_add_sphere(hero, "Right Pupil", 0.026, Vector3(0.14, 1.99, 0.405), "eye")
	_add_box(hero, "Scarf Tail", Vector3(0.14, 0.5, 0.08), Vector3(0.33, 1.39, -0.08), "scarf", false)
	for key in ["Left Arm", "Right Arm", "Left Leg", "Right Leg", "Head", "Body", "Scarf Tail"]:
		_parts[key] = hero.get_node_or_null(key)

func _animate_hero() -> void:
	var moving := Vector2(hero.velocity.x, hero.velocity.z).length() > 0.2
	var stride := sin(_time * 10.0) * 0.42 if moving else sin(_time * 2.2) * 0.035
	if is_instance_valid(_parts.get("Left Arm")):
		_parts["Left Arm"].rotation.x = stride
		_parts["Right Arm"].rotation.x = -stride
		_parts["Left Leg"].rotation.x = -stride * 0.8
		_parts["Right Leg"].rotation.x = stride * 0.8
		_parts["Head"].position.y = 1.92 + (sin(_time * 5.0) * 0.035 if moving else 0.0)
		_parts["Scarf Tail"].rotation.z = sin(_time * 8.0) * 0.12 if moving else sin(_time * 2.5) * 0.04

func _build_camera() -> void:
	camera = Camera3D.new()
	camera.name = "Adventure Camera"
	camera.position = Vector3(0.0, 4.1, 9.0)
	camera.fov = 54.0
	add_child(camera)
	camera.current = true
	camera.look_at(Vector3(0.0, 1.0, 0.0), Vector3.UP)

func _build_hud() -> void:
	var layer := CanvasLayer.new()
	layer.name = "Mobile HUD"
	add_child(layer)
	var root_control := Control.new()
	root_control.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root_control.mouse_filter = Control.MOUSE_FILTER_PASS
	layer.add_child(root_control)

	var title := Label.new()
	title.text = "RELIC"
	title.position = Vector2(22.0, 16.0)
	title.add_theme_font_size_override("font_size", 24)
	title.add_theme_color_override("font_color", Color("#fff0d0"))
	root_control.add_child(title)

	status_label = Label.new()
	status_label.position = Vector2(24.0, 54.0)
	status_label.add_theme_font_size_override("font_size", 16)
	status_label.add_theme_color_override("font_color", Color("#f4d58a"))
	status_label.text = "Find the treasure"
	root_control.add_child(status_label)

	dialogue_label = Label.new()
	dialogue_label.anchor_left = 0.5
	dialogue_label.anchor_right = 0.5
	dialogue_label.anchor_top = 0.0
	dialogue_label.anchor_bottom = 0.0
	dialogue_label.offset_left = -250.0
	dialogue_label.offset_right = 250.0
	dialogue_label.offset_top = 18.0
	dialogue_label.offset_bottom = 60.0
	dialogue_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	dialogue_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	dialogue_label.add_theme_font_size_override("font_size", 18)
	dialogue_label.add_theme_color_override("font_color", Color("#fff0d0"))
	root_control.add_child(dialogue_label)

	hint_label = Label.new()
	hint_label.anchor_left = 0.5
	hint_label.anchor_right = 0.5
	hint_label.anchor_top = 1.0
	hint_label.anchor_bottom = 1.0
	hint_label.offset_left = -210.0
	hint_label.offset_right = 210.0
	hint_label.offset_top = -34.0
	hint_label.offset_bottom = -10.0
	hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hint_label.add_theme_font_size_override("font_size", 14)
	hint_label.add_theme_color_override("font_color", Color("#e8e3d3"))
	hint_label.text = "Move · WASD / arrows · Reach the glowing relic"
	root_control.add_child(hint_label)

	joystick = JoystickScript.new()
	joystick.name = "Virtual Joystick"
	joystick.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_LEFT)
	joystick.position = Vector2(24.0, -174.0)
	joystick.size = Vector2(150.0, 150.0)
	joystick.axis_changed.connect(_on_joystick_axis_changed)
	root_control.add_child(joystick)

	var grid := GridContainer.new()
	grid.name = "Action Buttons"
	grid.columns = 2
	grid.anchor_left = 1.0
	grid.anchor_right = 1.0
	grid.anchor_top = 1.0
	grid.anchor_bottom = 1.0
	grid.offset_left = -188.0
	grid.offset_right = -20.0
	grid.offset_top = -180.0
	grid.offset_bottom = -20.0
	grid.add_theme_constant_override("h_separation", 8)
	grid.add_theme_constant_override("v_separation", 8)
	root_control.add_child(grid)
	_add_action_button(grid, "△\nATTACK", "attack")
	_add_action_button(grid, "□\nINTERACT", "interact")
	_add_action_button(grid, "○\nDODGE", "dodge")
	_add_action_button(grid, "×\nJUMP", "jump")

func _add_action_button(parent: GridContainer, caption: String, action: String) -> void:
	var button := Button.new()
	button.text = caption
	button.custom_minimum_size = Vector2(80.0, 72.0)
	button.focus_mode = Control.FOCUS_NONE
	button.add_theme_font_size_override("font_size", 16)
	button.add_theme_color_override("font_color", Color("#fff0d0"))
	button.add_theme_color_override("font_hover_color", Color("#ffffff"))
	button.add_theme_stylebox_override("normal", _button_style(Color("#2b3228")))
	button.add_theme_stylebox_override("hover", _button_style(Color("#444b32")))
	button.add_theme_stylebox_override("pressed", _button_style(Color("#715027")))
	button.pressed.connect(func(): _queue_action(action))
	parent.add_child(button)

func _button_style(color: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.border_color = Color("#c69c58")
	style.set_border_width_all(2)
	style.set_corner_radius_all(14)
	style.content_margin_left = 7.0
	style.content_margin_right = 7.0
	style.content_margin_top = 6.0
	style.content_margin_bottom = 6.0
	return style

func _on_joystick_axis_changed(value: Vector2) -> void:
	# The engine world uses negative Z as "up-screen".
	_joystick_axis = Vector2(value.x, value.y)

var _joystick_axis := Vector2.ZERO

func _queue_action(action: String) -> void:
	_queued_action = action

func _run_action(action: String) -> void:
	match action:
		"jump":
			if hero.is_on_floor():
				hero.velocity.y = JUMP_SPEED
			_show_line("RELIC HERO", "Whoa! Made it!")
		"attack":
			if is_instance_valid(_parts.get("Right Arm")):
				_parts["Right Arm"].rotation.x = -1.25
			_show_line("RELIC HERO", "Take that!")
		"interact":
			_check_treasure(true)
		"dodge":
			hero.velocity.x *= 1.7
			hero.velocity.z *= 1.7
			_show_line("RELIC HERO", "Quick dodge!")

func _check_treasure(force_interact: bool = false) -> void:
	if _collected or not is_instance_valid(hero):
		return
	var treasure_position := Vector3(6.4, 1.2, 0.0)
	if hero.global_position.distance_to(treasure_position) < 1.65 or (force_interact and hero.global_position.distance_to(treasure_position) < 3.2):
		_collected = true
		_update_status("Treasure found! Vertical-slice objective complete.")
		_show_line("RELIC HERO", "We found it! The treasure is ours!")
		hint_label.text = "TREASURE FOUND · prototype objective complete"

func _show_line(speaker: String, line: String) -> void:
	if is_instance_valid(dialogue_label):
		dialogue_label.text = "%s  ·  %s" % [speaker, line]

func _update_status(message: String) -> void:
	if is_instance_valid(status_label):
		status_label.text = message

func _add_box(parent: Node3D, node_name: String, dimensions: Vector3, position: Vector3, material_key: String, solid: bool) -> MeshInstance3D:
	var mesh_instance := MeshInstance3D.new()
	mesh_instance.name = node_name
	var box := BoxMesh.new()
	box.size = dimensions
	mesh_instance.mesh = box
	mesh_instance.material_override = _materials[material_key]
	mesh_instance.position = position
	parent.add_child(mesh_instance)
	if solid:
		var body := StaticBody3D.new()
		body.name = node_name + " Collision"
		mesh_instance.add_child(body)
		var collision := CollisionShape3D.new()
		var shape := BoxShape3D.new()
		shape.size = dimensions
		collision.shape = shape
		body.add_child(collision)
	return mesh_instance

func _add_sphere(parent: Node3D, node_name: String, radius: float, position: Vector3, material_key: String) -> MeshInstance3D:
	var mesh_instance := MeshInstance3D.new()
	mesh_instance.name = node_name
	var sphere := SphereMesh.new()
	sphere.radius = radius
	sphere.height = radius * 2.0
	mesh_instance.mesh = sphere
	mesh_instance.material_override = _materials[material_key]
	mesh_instance.position = position
	parent.add_child(mesh_instance)
	return mesh_instance

func _add_cylinder(parent: Node3D, node_name: String, radius: float, height: float, position: Vector3, material_key: String) -> MeshInstance3D:
	var mesh_instance := MeshInstance3D.new()
	mesh_instance.name = node_name
	var cylinder := CylinderMesh.new()
	cylinder.top_radius = radius
	cylinder.bottom_radius = radius * 1.08
	cylinder.height = height
	mesh_instance.mesh = cylinder
	mesh_instance.material_override = _materials[material_key]
	mesh_instance.position = position
	parent.add_child(mesh_instance)
	return mesh_instance

func _add_capsule(parent: Node3D, node_name: String, radius: float, height: float, position: Vector3, material_key: String) -> MeshInstance3D:
	var mesh_instance := MeshInstance3D.new()
	mesh_instance.name = node_name
	var capsule := CapsuleMesh.new()
	capsule.radius = radius
	capsule.height = height
	mesh_instance.mesh = capsule
	mesh_instance.material_override = _materials[material_key]
	mesh_instance.position = position
	parent.add_child(mesh_instance)
	return mesh_instance

func _add_torus(parent: Node3D, node_name: String, radius: float, tube: float, position: Vector3, material_key: String) -> MeshInstance3D:
	var mesh_instance := MeshInstance3D.new()
	mesh_instance.name = node_name
	var torus := TorusMesh.new()
	torus.inner_radius = radius - tube
	torus.outer_radius = radius + tube
	mesh_instance.mesh = torus
	mesh_instance.material_override = _materials[material_key]
	mesh_instance.position = position
	mesh_instance.rotation_degrees.x = 90.0
	parent.add_child(mesh_instance)
	return mesh_instance
