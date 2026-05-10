from app.services.recognition_service import recognize_embedding


CLASSIFICATION_UNKNOWN = "UNKNOWN"
CLASSIFICATION_AUTHORIZED = "AUTHORIZED"
CLASSIFICATION_KNOWN_NON_AUTHORIZED = "KNOWN_NON_AUTHORIZED"


def classify(embedding, access_status_lookup=None):
    recognition = recognize_embedding(embedding)

    if recognition.get("is_unknown"):
        return {
            "status": CLASSIFICATION_UNKNOWN,
            "recognition": recognition,
        }

    person_name = recognition.get("person_name")
    access_status = None
    if callable(access_status_lookup):
        access_status = access_status_lookup(person_name)

    if access_status == "NON_AUTHORIZED":
        status = CLASSIFICATION_KNOWN_NON_AUTHORIZED
    else:
        status = CLASSIFICATION_AUTHORIZED

    return {
        "status": status,
        "recognition": recognition,
        "person_name": person_name,
        "access_status": access_status,
    }
