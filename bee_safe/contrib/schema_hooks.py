from drf_spectacular.plumbing import build_parameter_type

from config.settings.base import LANGUAGES


def add_accept_language_postprocessing(result, generator, request, public):
    """
    Inject Accept-Language header param into all operations in the OpenAPI result object.
    """

    accept_lang_param = build_parameter_type(
        name="Accept-Language",
        schema={"type": "string", "enum": [code for code, _ in LANGUAGES]},
        location="header",
        required=False,
        description="Language code for translations (e.g., 'en', 'zh-hans', 'my')",
    )

    for path, path_item in result["paths"].items():
        for method in path_item.keys():
            operation = path_item[method]
            parameters = operation.setdefault("parameters", [])

            # Avoid duplicate addition
            if not any(p.get("name") == "Accept-Language" for p in parameters):
                parameters.append(accept_lang_param)

    return result
