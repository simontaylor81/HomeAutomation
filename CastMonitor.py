import pychromecast

all_casts = pychromecast.get_chromecasts()

livingroom = next((x for x in all_casts if x.device.friendly_name == 'Living Room'), None)
if livingroom == None:
    print "Living Room Chromecast not found."
    exit(1)

livingroom.wait()


def is_casting(media_status):
    return media_status.player_state != pychromecast.controllers.media.MEDIA_PLAYER_STATE_UNKNOWN
def is_connected(cast_status):
    return cast_status.session_id != None

class Listener:
    def __init__(self):
        self.curr_is_casting = is_casting(livingroom.media_controller.status)
        self.curr_is_connected = is_connected(livingroom.status)

    def new_media_status(self, status):
        new_is_casting = is_casting(status)
        if not self.curr_is_casting and new_is_casting:
            print "Casting Media"
        elif self.curr_is_casting and not new_is_casting:
            print "Media casting stopped"
        
        self.curr_is_casting = new_is_casting

    def new_cast_status(self, status):
        new_is_connected = is_connected(status)
        if not self.curr_is_connected and new_is_connected:
            print "Connected"
        elif self.curr_is_connected and not new_is_connected:
            print "Disconnected"
        
        self.curr_is_connected = new_is_connected

listener = Listener()
livingroom.media_controller.register_status_listener(listener)
livingroom.register_status_listener(listener)

livingroom.socket_client.join()
