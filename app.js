/**
 * Find gateway(s)
 * Register this client with gateway (store client_id/username)
 * 
 * Find lights (store lights; id and name)
 * Send commands to light(s): set lightstate
 * search new lights
 * add new lights
 * re-name lights
 * 
 * create group
 * delete group
 * obtain groups
 * update group name
 * update group membership
 * Send command to group 
 * 
 * get existing schedules
 * get schedule info
 * create schedule
 * update schedule
 * delete schedule
 * 
 * 
 * MQTT topics:
 * light
 *  /hue/gateway_id/light/{in,out}                              (get lights, add light)
 *  /hue/gateway_id/light/light_id/{direction}/name             (string)
 *  /hue/gateway_id/light/light_id/{direction}/switch           (true, false)
 *  /hue/gateway_id/light/light_id/{direction}/level            (0..100)
 *  
 * group
 *  /hue/gateway_id/group/{in,out}       (get groups, add, remove group)
 *  /hue/gateway_id/group/group_id/target
 *  
 * schedule
 *  /hue/gateway_id/schedule/{in,out}  	(add, remove schedule)
 *  /hue/gateway_id/schedule/schedule_id/target
 *  
 * scene
 *  /gateway_id/scene/scene_id/target
 * 
 * light examples:
 *  /hue/001788fffe0a6fdc/light/1/in/switch      (binary)
 *  /hue/001788fffe0a6fdc/light/1/in/level       (percent)
 *  /hue/001788fffe0a6fdc/light/1/in/color       (rgb, hsl, philips-xy, temperature/brightness)
 * 
 * /hue_gateway/1/alert       (unary)
 * /hue_gateway/1/white       (colourTemp, pertenceBright)
 * /hue_gateway/1/hsl         (hue, saturation, brightness/luminence)
 * /hue_gateway/1/xy          (x, y)
 * /hue_gateway/1/rgb         (red, green, blue)
 * 
 */
